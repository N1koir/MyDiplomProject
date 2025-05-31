import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import {ChevronLeft, ChevronRight, Image as ImageIcon, Plus, Minus, ChevronDown, Trash2, ChevronUp} from 'lucide-react';
import MarkdownEditor from '@uiw/react-markdown-editor';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { api } from '../../services/api';

interface CourseData {
    title: string;
    description: string;
    icon?: File;
    pages: {
        content: string;
        order: number;
    }[];
    monetizationType: number;
    price?: number;
    category: number;
    ageRestriction: number;
    level: number;
}

interface SelectOption {
    id: number;
    type: string;
}

const CourseForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Данные курса
    const [courseData, setCourseData] = useState<CourseData>({
        title: '',
        description: '',
        pages: [{ content: '', order: 1 }],
        monetizationType: 1,
        category: 1,
        ageRestriction: 1,
        level: 1
    });

    // Опции для селектов
    const [categories, setCategories] = useState<SelectOption[]>([]);
    const [ageRestrictions, setAgeRestrictions] = useState<SelectOption[]>([]);
    const [levels, setLevels] = useState<SelectOption[]>([]);
    const [monetizationTypes, setMonetizationTypes] = useState<SelectOption[]>([]);

    // Загрузка опций и данных курса при редактировании
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [
                    categoriesRes,
                    ageRes,
                    levelsRes,
                    monetizationRes
                ] = await Promise.all([
                    api.get('/categories'),
                    api.get('/age-restrictions'),
                    api.get('/levels'),
                    api.get('/monetization-types')
                ]);

                setCategories(categoriesRes.data);
                setAgeRestrictions(ageRes.data);
                setLevels(levelsRes.data);
                setMonetizationTypes(monetizationRes.data);
            } catch (error) {
                console.error('Error fetching options:', error);
                showToast('Ошибка при загрузке данных', 'error');
            }
        };

        const fetchCourse = async () => {
            if (!id || id === 'new') return;

            try {
                setIsLoading(true);
                const response = await api.get(`/courses/${id}`);
                const course = response.data;

                setCourseData({
                    title: course.title,
                    description: course.description || '',
                    pages: course.pages.map((p: any) => ({
                        content: p.file,
                        order: p.numberpage
                    })),
                    monetizationType: course.idmonetizationcourse,
                    price: course.price,
                    category: course.idcategory,
                    ageRestriction: course.idagepeople,
                    level: course.idlevelknowledge
                });
            } catch (error) {
                console.error('Error fetching course:', error);
                showToast('Ошибка при загрузке курса', 'error');
                navigate('/courses/editor');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOptions();
        fetchCourse();
    }, [id]);

    // Валидация шага
    const validateStep = () => {
        switch (step) {
            case 1:
                return courseData.title.trim() !== '';
            case 2:
                return courseData.pages.every(page => page.content.trim() !== '');
            case 3:
                return true;
            default:
                return false;
        }
    };

    // Обработка изображения
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            showToast('Поддерживаются только форматы JPEG и PNG', 'error');
            return;
        }

        if (file.size > 6 * 1024 * 1024) {
            showToast('Размер файла не должен превышать 6 МБ', 'error');
            return;
        }

        // Создаем временный URL для предпросмотра
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Масштабируем изображение до 300x300
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 300;
                canvas.height = 300;

                if (ctx) {
                    ctx.drawImage(img, 0, 0, 300, 300);
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const scaledFile = new File([blob], file.name, {
                                type: file.type
                            });
                            setCourseData({ ...courseData, icon: scaledFile });
                        }
                    }, file.type);
                }
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    // Добавление новой страницы
    const addPage = () => {
        setCourseData({
            ...courseData,
            pages: [
                ...courseData.pages,
                { content: '', order: courseData.pages.length + 1 }
            ]
        });
    };

    // Удаление страницы
    const removePage = (index: number) => {
        if (courseData.pages.length === 1) {
            showToast('Курс должен содержать хотя бы одну страницу', 'info');
            return;
        }

        const newPages = courseData.pages.filter((_, i) => i !== index);
        setCourseData({
            ...courseData,
            pages: newPages.map((page, i) => ({ ...page, order: i + 1 }))
        });
    };

    // Изменение порядка страниц
    const movePage = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === courseData.pages.length - 1)
        ) return;

        const newPages = [...courseData.pages];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        [newPages[index], newPages[swapIndex]] = [newPages[swapIndex], newPages[index]];
        newPages.forEach((page, i) => page.order = i + 1);

        setCourseData({ ...courseData, pages: newPages });
    };

    // Сохранение курса
    const saveCourse = async () => {
        if (!user) return;

        try {
            setIsLoading(true);

            const formData = new FormData();
            formData.append('title', courseData.title);
            formData.append('description', courseData.description);
            if (courseData.icon) {
                formData.append('icon', courseData.icon);
            }
            formData.append('idusername', user.idusername.toString());
            formData.append('idmonetizationcourse', courseData.monetizationType.toString());
            if (courseData.monetizationType === 2 && courseData.price) {
                formData.append('price', courseData.price.toString());
            }
            formData.append('idcategory', courseData.category.toString());
            formData.append('idagepeople', courseData.ageRestriction.toString());
            formData.append('idlevelknowledge', courseData.level.toString());
            formData.append('pages', JSON.stringify(courseData.pages));

            if (id && id !== 'new') {
                await api.put(`/courses/${id}`, formData);
                showToast('Курс успешно обновлен', 'success');
            } else {
                await api.post('/courses', formData);
                showToast('Курс успешно создан', 'success');
            }

            navigate('/courses/editor');
        } catch (error) {
            console.error('Error saving course:', error);
            showToast('Ошибка при сохранении курса', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Шаги */}
                <div className="flex items-center justify-between mb-8">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`flex-1 h-2 ${
                                s === step
                                    ? 'bg-orange-600'
                                    : s < step
                                        ? 'bg-green-500'
                                        : 'bg-gray-200'
                            }`}
                        />
                    ))}
                </div>

                {/* Шаг 1: Начальные данные */}
                {step === 1 && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold mb-6">Основная информация</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Название курса*
                                </label>
                                <input
                                    type="text"
                                    value={courseData.title}
                                    onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="Введите название курса"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Описание
                                </label>
                                <textarea
                                    value={courseData.description}
                                    onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="Введите описание курса"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Иконка курса
                                </label>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                                        <ImageIcon size={20} className="mr-2" />
                                        Загрузить
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/jpeg,image/png"
                                            onChange={handleImageUpload}
                                        />
                                    </label>
                                    {courseData.icon && (
                                        <div className="relative w-16 h-16">
                                            <img
                                                src={URL.createObjectURL(courseData.icon)}
                                                alt="Preview"
                                                className="w-full h-full object-cover rounded-md"
                                            />
                                            <button
                                                onClick={() => setCourseData({ ...courseData, icon: undefined })}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                            >
                                                <Minus size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                    Форматы: JPEG, PNG. Макс. размер: 6 МБ. Разрешение: 300x300 пикселей
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Шаг 2: Редактор Markdown */}
                {step === 2 && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold mb-6">Содержание курса</h2>

                        <div className="space-y-8">
                            {courseData.pages.map((page, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium">
                                            Страница {page.order}
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => movePage(index, 'up')}
                                                disabled={index === 0}
                                                className="p-1 hover:bg-gray-100 rounded-md disabled:opacity-50"
                                            >
                                                <ChevronUp size={20} />
                                            </button>
                                            <button
                                                onClick={() => movePage(index, 'down')}
                                                disabled={index === courseData.pages.length - 1}
                                                className="p-1 hover:bg-gray-100 rounded-md disabled:opacity-50"
                                            >
                                                <ChevronDown size={20} />
                                            </button>
                                            <button
                                                onClick={() => removePage(index)}
                                                className="p-1 text-red-500 hover:bg-red-50 rounded-md"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="h-[500px] border rounded-lg overflow-hidden">
                                        <MarkdownEditor
                                            value={page.content}
                                            onChange={(value) => {
                                                const newPages = [...courseData.pages];
                                                newPages[index].content = value;
                                                setCourseData({ ...courseData, pages: newPages });
                                            }}
                                            enablePreview
                                            toolbars={[
                                                'bold', 'italic', 'strikethrough',
                                                'heading-1', 'heading-2', 'heading-3',
                                                'unordered-list', 'ordered-list',
                                                'link', 'image', 'code'
                                            ]}
                                        />
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={addPage}
                                className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                <Plus size={20} className="mr-2" />
                                Добавить страницу
                            </button>
                        </div>
                    </div>
                )}

                {/* Шаг 3: Завершение создания */}
                {step === 3 && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold mb-6">Настройки курса</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Тип доступа
                                </label>
                                <select
                                    value={courseData.monetizationType}
                                    onChange={(e) => setCourseData({
                                        ...courseData,
                                        monetizationType: parseInt(e.target.value)
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    {monetizationTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {courseData.monetizationType === 2 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Стоимость (₽)
                                    </label>
                                    <input
                                        type="number"
                                        min="1000"
                                        max="20000"
                                        value={courseData.price || ''}
                                        onChange={(e) => setCourseData({
                                            ...courseData,
                                            price: parseInt(e.target.value)
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        От 1 000 до 20 000 рублей
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Категория
                                </label>
                                <select
                                    value={courseData.category}
                                    onChange={(e) => setCourseData({
                                        ...courseData,
                                        category: parseInt(e.target.value)
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Возрастное ограничение
                                </label>
                                <select
                                    value={courseData.ageRestriction}
                                    onChange={(e) => setCourseData({
                                        ...courseData,
                                        ageRestriction: parseInt(e.target.value)
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    {ageRestrictions.map((age) => (
                                        <option key={age.id} value={age.id}>
                                            {age.type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Уровень сложности
                                </label>
                                <select
                                    value={courseData.level}
                                    onChange={(e) => setCourseData({
                                        ...courseData,
                                        level: parseInt(e.target.value)
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    {levels.map((level) => (
                                        <option key={level.id} value={level.id}>
                                            {level.type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Навигация */}
                <div className="flex justify-between mt-8">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            <ChevronLeft size={20} className="mr-2" />
                            Назад
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/courses/editor')}
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            <ChevronLeft size={20} className="mr-2" />
                            К списку
                        </button>
                    )}

                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={!validateStep()}
                            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                        >
                            Далее
                            <ChevronRight size={20} className="ml-2" />
                        </button>
                    ) : (
                        <button
                            onClick={saveCourse}
                            disabled={isLoading}
                            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <span className="mr-2">Сохранение...</span>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                </>
                            ) : (
                                'Сохранить курс'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseForm;