import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import {
    ChevronLeft, ChevronRight, Image as ImageIcon,
    Plus, Minus, ChevronDown, Trash2, ChevronUp
} from 'lucide-react';
import { marked } from 'marked';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { api } from '../../services/api';
import DOMPurify from 'dompurify';


    interface CourseData {
        title: string;
        description: string;
        icon?: File | null;
        iconPreview?: string;
        pages: {
            content: string;
            order: number;
            previewExpanded: boolean;
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

const SUPPORTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): void => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), waitFor);
    };
};

export const CourseFormPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Основной стейт курса
    const [courseData, setCourseData] = useState<CourseData>({
        title: '',
        description: '',
        icon: null,
        iconPreview: '',
        pages: [{ content: '', order: 1, previewExpanded: false }],
        monetizationType: 0,
        category: 0,
        ageRestriction: 0,
        level: 0
    });

    // refs для textarea и file inputs
    const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
    const fileInputs = useRef<(HTMLInputElement | null)[]>([]);

    // для показа какой страницы сейчас открыт превью
    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    // хранит html-превью по индексам
    const [pagesHtml, setPagesHtml] = useState<Record<number, string>>({});

    // настройка marked с videoExtension
    useEffect(() => {
        marked.use({
            extensions: [{
                name: 'videoExtension',
                level: 'block',
                start(src) { return src.indexOf('%%VIDEO{') !== -1 ? src.indexOf('%%VIDEO{') : undefined; },
                tokenizer(src) {
                    const rule = /^%%VIDEO\{([^}]+)\}%%/;
                    const match = rule.exec(src);
                    if (match) {
                        return { type: 'videoExtension', raw: match[0], url: match[1].trim() };
                    }
                },
                renderer(token) {
                    return `<video controls src="${token.url}" style="max-width:100%;"></video>`;
                }
            }]
        });
    }, []);

    // безопасный рендер markdown → html
    const safeMarkdown = async (content: string): Promise<string> => {
        try {
            const withNbsp = content
                .replace(/\n\s*\n/g, '\n\n&nbsp;\n\n')
                .replace(/^(\s*\n)+/g, '&nbsp;\n')
                .replace(/(\n\s*)+$/g, '\n&nbsp;');

            const rawHtml = await marked.parse(withNbsp, {
                mangle: false,
                headerIds: false,
                breaks: true,
                silent: true
            });

            return DOMPurify.sanitize(rawHtml, {
                ADD_TAGS: ['img', 'iframe'],
                ADD_ATTR: ['src', 'alt', 'title', 'allow', 'allowfullscreen', 'frameborder', 'scrolling'],
                FORBID_TAGS: ['style'],
                FORBID_ATTR: ['style']
            });
        } catch (err) {
            console.error('Markdown processing error:', err);
            return `<div class="error">Ошибка отображения контента</div>`;
        }
    };

    // обновление превью конкретной страницы
    const updatePagePreview = useCallback(
        async (content: string, pageIndex: number) => {
            const html = await safeMarkdown(content);
            setPagesHtml(prev => ({ ...prev, [pageIndex]: html }));
        },
        []
    );

    // при любых изменениях содержимого страниц автоматически обновляем превью
    useEffect(() => {
        courseData.pages.forEach((p, idx) => {
            updatePagePreview(p.content, idx);
        });
    }, [courseData.pages, updatePagePreview]);

    // хелпер вставки форматирования / медиа
    const insertAtCursor = (index: number, template: string) => {
        const ta = textareaRefs.current[index];
        if (!ta) return;
        const start = ta.selectionStart, end = ta.selectionEnd;
        const text = ta.value;
        const sel = text.substring(start, end);
        const newText = text.substring(0, start)
            + template.replace('$SELECTION', sel)
            + text.substring(end);
        const pages = [...courseData.pages];
        pages[index].content = newText;
        setCourseData({ ...courseData, pages });
        setTimeout(() => {
            ta.focus();
            const pos = start + template.length;
            ta.setSelectionRange(pos, pos);
        }, 0);
    };

    // сжатие изображения в blob
    const compressImage = (file: File, maxW: number, maxH: number, q: number) =>
        new Promise<Blob>((resolve, reject) => {
            if (!file.type.startsWith('image/')) return reject(new Error('Не изображение'));
            const img = new Image();
            const reader = new FileReader();
            reader.onerror = () => reject(new Error('Ошибка чтения'));
            reader.onload = e => img.src = e.target?.result as string;
            img.onerror = () => reject(new Error('Ошибка загрузки img'));
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width, h = img.height;
                const ar = w / h;
                if (w > h && w > maxW) { w = maxW; h = w / ar; }
                else if (h > maxH) { h = maxH; w = h * ar; }
                canvas.width = Math.floor(w); canvas.height = Math.floor(h);
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Нет контекста'));
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Не blob')), file.type, q);
            };
            reader.readAsDataURL(file);
        });

    // вставка медиа-файла
    const handleInsertMedia = async (file: File, pageIndex: number) => {
        try {
            let dataUrl: string;
            if (file.type.startsWith('image/')) {
                const blob = await compressImage(file, 800, 800, 0.7);
                dataUrl = await new Promise<string>(res => {
                    const r = new FileReader();
                    r.onload = e => res(e.target?.result as string);
                    r.readAsDataURL(blob);
                });
            } else {
                dataUrl = await new Promise<string>(res => {
                    const r = new FileReader();
                    r.onload = e => res(e.target?.result as string);
                    r.readAsDataURL(file);
                });
            }
            const md = file.type.startsWith('image/')
                ? `![${file.name}](${dataUrl})`
                : `%%VIDEO{${dataUrl}}%%`;
            insertAtCursor(pageIndex, md);
        } catch {
            showToast('Не удалось обработать файл', 'error');
        }
    };

    // Опции для селектов
    const [categories, setCategories] = useState<SelectOption[]>([]);
    const [ageRestrictions, setAgeRestrictions] = useState<SelectOption[]>([]);
    const [levels, setLevels] = useState<SelectOption[]>([]);
    const [monetizationTypes, setMonetizationTypes] = useState<SelectOption[]>([]);

    // Загрузка опций и данных курса при редактировании
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [categoriesRes, ageRes, levelsRes, monetizationRes] = await Promise.all([
                    api.get('/category/categories'),
                    api.get('/category/age-restrictions'),
                    api.get('/category/levels'),
                    api.get('/category/monetization-types'),
                ]);

                if (categoriesRes.data.success) setCategories(categoriesRes.data.categories);
                if (ageRes.data.success) setAgeRestrictions(ageRes.data.ageRestrictions);
                if (levelsRes.data.success) setLevels(levelsRes.data.levels);
                if (monetizationRes.data.success) setMonetizationTypes(monetizationRes.data.monetizationTypes);
            } catch (error) {
                console.error('Ошибка при загрузки данных:', error);
                showToast('Ошибка при загрузке данных', 'error');
            }
        };

        const fetchCourse = async () => {

            // Создание
            if (!id || id === 'new') return;

            // Редактирование
            try {
                setIsLoading(true);
                const response = await api.get(`/coursescontrollercreateandedit/${id}`);
                const course = response.data;

                const base64ToFile = (base64: string, filename: string, mimeType: string) => {
                    const byteString = atob(base64.split(',')[1]);
                    const ab = new ArrayBuffer(byteString.length);
                    const ia = new Uint8Array(ab);
                    for (let i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                    }
                    return new File([ab], filename, { type: mimeType });
                };

                const iconFile = base64ToFile(course.iconBase64, 'icon.png', 'image/png');

                setCourseData({
                    title: course.title,
                    description: course.description || '',
                    pages: course.pages.map((p: any) => ({
                        content: p.content,
                        order: p.order,
                        previewExpanded: false
                    })),
                    monetizationType: course.monetizationType,
                    price: course.price,
                    category: course.category,
                    ageRestriction: course.ageRestriction,
                    level: course.level,
                    icon: iconFile,
                    iconPreview: course.iconBase64
                });

            } catch (error) {
                console.error('Ошибка при загрузки курса:', error);
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
                return (
                    courseData.title.trim() !== '' &&
                    courseData.description.trim() !== '' &&

                    courseData.icon !== null &&
                    courseData.icon !== undefined
                );
            case 2:
                return courseData.pages.every(page => page.content.trim() !== '');
            case 3:
                return (
                    courseData.monetizationType !== 0 &&
                    courseData.category !== 0 &&
                    courseData.ageRestriction !== 0 &&
                    courseData.level !== 0 &&

                    (courseData.monetizationType === 2
                        ? courseData.price >= 1000 && courseData.price <= 20000
                        : true)
                );
            default:
                return false;
        }
    };

    // Обработка изображения
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            showToast('Поддерживаются только форматы JPEG и PNG', 'Ошибка');
            return;
        }

        if (file.size > 6 * 1024 * 1024) {
            showToast('Размер файла не должен превышать 6 МБ', 'Ошибка');
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
        const newPage = {
            content: '',
            order: courseData.pages.length + 1,
            previewExpanded: false
        };

        setCourseData({
            ...courseData,
            pages: [...courseData.pages, newPage]
        });

        // Инициализируем состояние предпросмотра для новой страницы
        setPagesHtml(prev => ({
            ...prev,
            [courseData.pages.length]: "" // Индекс новой страницы
        }));
    };

    // Удаление страницы
    const removePage = (index: number) => {
        if (courseData.pages.length === 1) {
            showToast('Курс должен содержать хотя бы одну страницу', 'info');
            return;
        }

        const newPages = courseData.pages.filter((_, i) => i !== index);

        // Обновляем порядковые номера
        const reorderedPages = newPages.map((page, i) => ({
            ...page,
            order: i + 1
        }));

        setCourseData({
            ...courseData,
            pages: reorderedPages
        });

        // Очищаем рефы
        textareaRefs.current.splice(index, 1);
        fileInputs.current.splice(index, 1);

        // Обновляем предпросмотр
        setPagesHtml(prev => {
            const newPagesHtml = { ...prev };
            delete newPagesHtml[index];
            return newPagesHtml;
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

            // Добавляем основные данные
            formData.append('title', courseData.title);
            formData.append('description', courseData.description);
            formData.append('idusername', user.idusername.toString());
            formData.append('idmonetizationcourse', courseData.monetizationType.toString());
            formData.append('idcategory', courseData.category.toString());
            formData.append('idagepeople', courseData.ageRestriction.toString());
            formData.append('idlevelknowledge', courseData.level.toString());

            // Обработка цены
            if (courseData.monetizationType === 2 && courseData.price) {
                formData.append('price', courseData.price.toString());
            }

            // Обработка иконки
            if (courseData.icon instanceof File) {
                formData.append('Icon', courseData.icon);
            }

            // Обработка страниц и медиа
            const pagesWithMedia = await Promise.all(courseData.pages.map(async (page) => {
                // Извлекаем все медиа-идентификаторы из контента
                const mediaIds = [
                    ...page.content.matchAll(/%%VIDEO\{([^}]+)\}%%/g),
                    ...page.content.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)
                ].map(match => match[1]);

                // Заменяем идентификаторы на фактические URL
                let processedContent = page.content;
                for (const mediaId of mediaIds) {
                    const mediaUrl = sessionStorage.getItem(mediaId);
                    if (mediaUrl) {
                        // Сохраняем медиа в FormData
                        const blob = await fetch(mediaUrl).then(r => r.blob());
                        const file = new File([blob], `${mediaId}.${blob.type.split('/')[1]}`, { type: blob.type });
                        formData.append(`media_${mediaId}`, file);

                        // Заменяем в контенте
                        processedContent = processedContent.replace(
                            mediaId,
                            `media_${mediaId}`
                        );
                    }
                }

                return {
                    ...page,
                    content: processedContent
                };
            }));

            formData.append('pages', JSON.stringify(pagesWithMedia));

            // Отправка данных
            if (id && id !== 'new') {
                await api.put(`/coursescontrollercreateandedit/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showToast('Курс успешно обновлен', 'success');
            } else {
                await api.post('/coursescontrollercreateandedit', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showToast('Курс успешно создан', 'success');
            }

            // Очищаем временное хранилище
            Object.keys(sessionStorage).forEach(key => {
                if (key.startsWith('media_')) {
                    sessionStorage.removeItem(key);
                }
            });

            navigate('/courses/editor');
        } catch (error) {
            console.error('Ошибка сохранения:', error);
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
                                            className="hidden"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                    </label>
                                    {(courseData.icon || courseData.iconPreview) && (
                                        <div className="relative w-16 h-16">
                                            <img
                                                src={
                                                    courseData.icon
                                                        ? URL.createObjectURL(courseData.icon)
                                                        : courseData.iconPreview!
                                                }
                                                alt="Preview"
                                                className="w-full h-full object-cover rounded-md"
                                            />
                                            <button
                                                onClick={() => setCourseData({
                                                    ...courseData,
                                                    icon: undefined,
                                                    iconPreview: undefined
                                                })}
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

                {step === 2 && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold mb-6">Содержание курса</h2>
                        <div className="space-y-8">
                            {courseData.pages.map((page, index) => (
                                <div key={index} className="border rounded-lg">
                                    <div className="flex justify-between items-center p-4 bg-gray-50 sticky top-0 z-10">
                                        <h3 className="text-lg font-medium">Страница {page.order}</h3>
                                        <div className="flex items-center space-x-2">
                                            {/* Кнопки перемещения страниц */}
                                            <button onClick={() => movePage(index, 'up')}
                                                    disabled={index===0}
                                                    className="p-1 hover:bg-gray-100 rounded-md disabled:opacity-50">
                                                <ChevronUp size={20} />
                                            </button>
                                            <button onClick={() => movePage(index, 'down')}
                                                    disabled={index===courseData.pages.length-1}
                                                    className="p-1 hover:bg-gray-100 rounded-md disabled:opacity-50">
                                                <ChevronDown size={20} />
                                            </button>
                                            <button onClick={() => removePage(index)}
                                                    className="p-1 text-red-500 hover:bg-red-50 rounded-md">
                                                <Trash2 size={20} />
                                            </button>

                                            {/* Кнопки форматирования */}
                                            <button
                                                onClick={() => insertAtCursor(index, `**$SELECTION**`)}
                                                className="p-1 hover:bg-gray-100 rounded-md"
                                                title="Жирный"
                                            >
                                                <strong>B</strong>
                                            </button>
                                            <button
                                                onClick={() => insertAtCursor(index, `*$SELECTION*`)}
                                                className="p-1 hover:bg-gray-100 rounded-md"
                                                title="Курсив"
                                            >
                                                <em>I</em>
                                            </button>
                                            <button
                                                onClick={() => insertAtCursor(index, "~~$SELECTION~~")}
                                                className="p-1 hover:bg-gray-100 rounded-md"
                                                title="Зачёркнутый"
                                            >
                                                <s>S</s>
                                            </button>
                                            <button
                                                onClick={() => insertAtCursor(index, `<u>$SELECTION</u>`)}
                                                className="p-1 hover:bg-gray-100 rounded-md"
                                                title="Подчёркнутый"
                                            >
                                                <span className="underline">U</span>
                                            </button>
                                            <button
                                                onClick={() => insertAtCursor(index, "```\n$SELECTION\n```\n")}
                                                className="p-1 hover:bg-gray-100 rounded-md"
                                                title="Блок кода"
                                            >
                                                <code>{"</>"}</code>
                                            </button>
                                            <button onClick={() => fileInputs.current[index]?.click()}
                                                    className="p-1 hover:bg-gray-100 rounded-md"
                                                    title="Медиа">
                                                <ImageIcon size={20} />
                                            </button>
                                            <input
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.gif"
                                                className="hidden"
                                                ref={el => fileInputs.current[index] = el}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    if (!SUPPORTED_TYPES.includes(file.type)) {
                                                        showToast('Неподдерживаемый формат', 'error');
                                                        return;
                                                    }
                                                    handleInsertMedia(file, index);
                                                    e.target.value = '';
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Редактор Markdown */}
                                    <div className="p-4">
                                        <textarea
                                            ref={el => textareaRefs.current[index] = el}
                                            value={page.content}
                                            onChange={e => {
                                                const pagesCopy = [...courseData.pages];
                                                pagesCopy[index].content = e.target.value;
                                                setCourseData({ ...courseData, pages: pagesCopy });
                                            }}
                                            className="w-full min-h-[300px] p-3 font-mono text-sm border rounded-md"
                                        />
                                    </div>

                                    {/* Предпросмотр */}
                                    <div className="border-t">
                                        <button
                                            onClick={() => {
                                                const pagesCopy = [...courseData.pages];
                                                pagesCopy[index].previewExpanded = !pagesCopy[index].previewExpanded;
                                                setCourseData({ ...courseData, pages: pagesCopy });

                                                // Вариант 1: всегда обновлять превью
                                                if (pagesCopy[index].previewExpanded) {
                                                    updatePagePreview(pagesCopy[index].content, index);
                                                }

                                                // — или Вариант 2: только при первом раскрытии
                                                // if (pagesCopy[index].previewExpanded && pagesHtml[index] === undefined) {
                                                //   updatePagePreview(pagesCopy[index].content, index);
                                                // }
                                            }}
                                            className="w-full p-3 bg-gray-100 hover:bg-gray-200 text-left font-medium flex items-center"
                                        >
                                            <span>Предпросмотр</span>
                                            <ChevronDown
                                                size={20}
                                                className={`ml-2 transition-transform ${page.previewExpanded ? 'rotate-180' : ''}`}
                                            />
                                        </button>

                                        {/* Само окно превью */}
                                        {page.previewExpanded && (
                                            <div id={`preview-${index}`} className="prose p-4">
                                                {pagesHtml[index] === undefined ? (
                                                    <div>Загрузка превью…</div>
                                                ) : pagesHtml[index] ? (
                                                    <div dangerouslySetInnerHTML={{ __html: pagesHtml[index] }} />
                                                ) : (
                                                    <div><em>Нет содержимого</em></div>
                                                )}
                                            </div>
                                        )}
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
                            {/* Тип доступа */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Тип доступа
                                </label>
                                <select
                                    value={courseData.monetizationType}
                                    onChange={(e) => setCourseData({
                                        ...courseData,
                                        monetizationType: Number(e.target.value)
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value={0}>Тип не задан</option>
                                    {monetizationTypes.map((type) => (
                                        <option key={type.idmonetizationcourse} value={type.idmonetizationcourse}>
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

                            {/* Категория */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Категория
                                </label>
                                <select
                                    value={courseData.category}
                                    onChange={(e) => setCourseData({
                                        ...courseData,
                                        category: Number(e.target.value)
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value={0}>Тип не задан</option>
                                    {categories.map((category) => (
                                        <option key={category.idcategory} value={category.idcategory}>
                                            {category.type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Возрастное ограничение */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Возрастное ограничение
                                </label>
                                <select
                                    value={courseData.ageRestriction}
                                    onChange={(e) => setCourseData({
                                        ...courseData,
                                        ageRestriction: Number(e.target.value)
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value={0}>Тип не задан</option>
                                    {ageRestrictions.map((age) => (
                                        <option key={age.idagepeople} value={age.idagepeople}>
                                            {age.type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Уровень сложности */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Уровень сложности
                                </label>
                                <select
                                    value={courseData.level}
                                    onChange={(e) => setCourseData({
                                        ...courseData,
                                        level: Number(e.target.value)
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value={0}>Тип не задан</option>
                                    {levels.map((level) => (
                                        <option key={level.idlevelknowledge} value={level.idlevelknowledge}>
                                            {level.type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Шаг 4: Сохранение */}
                {step === 4 && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-center text-2xl font-bold mb-6">Сохранить курс?</h2>
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

                    {step < 4 ? (
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

export default CourseFormPage;