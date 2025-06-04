import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { ChevronLeft, ChevronRight, CreditCard, X } from 'lucide-react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { api } from '../../services/api';

interface PageListDto {
    idPage: number;
    numberPage: number;
    fileContent: string;
}

interface CourseListViewDto {
    idCourse: number;
    title: string;
    description: string;
    idMonetizationCourse: number; // 1 = бесплатно, 2 = платный
    price?: number;
    pagesCount: number;
    category: string;
    age: string;
    level: string;
    authorId: number; // новый флаг — кто автор курса
    pages: PageListDto[];
}

interface PaymentFormData {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvc: string;
}

const CourseViewPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [course, setCourse] = useState<CourseListViewDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasPaid, setHasPaid] = useState(false);
    const [isOwner, setIsOwner] = useState(false); // новый стейт
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);

    // Состояние формы оплаты
    const [paymentData, setPaymentData] = useState<PaymentFormData>({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvc: ''
    });

    // Валидация формы оплаты
    const validatePaymentForm = () => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        const year = parseInt(paymentData.expiryYear);
        const month = parseInt(paymentData.expiryMonth);

        return (
            paymentData.cardNumber.replace(/\s/g, '').length === 16 &&
            /^\d+$/.test(paymentData.cardNumber.replace(/\s/g, '')) &&
            paymentData.cvc.length === 3 &&
            /^\d+$/.test(paymentData.cvc) &&
            year >= 2025 &&
            (year > 2025 || (year === 2025 && month >= 1)) &&
            month >= 1 &&
            month <= 12
        );
    };

    // Загрузка данных курса + проверка оплаты
    useEffect(() => {
        const loadCourse = async () => {
            if (!id || !user) return;

            try {
                setIsLoading(true);
                // 1) Получаем курс
                const courseRes = await api.get(`/courses/${id}`);

                if (!courseRes.data.success) {
                    showToast('Курс не найден', 'error');
                    navigate('/courses');
                    return;
                }

                const fetchedCourse: CourseListViewDto = courseRes.data.course;
                setCourse(fetchedCourse);

                // Проверяем, является ли текущий пользователь автором курса
                if (fetchedCourse.authorId === user.idusername) {
                    setIsOwner(true);
                    setHasPaid(true);
                } else {
                    setIsOwner(false);
                    // 3) Если не владелец и курс платный, проверяем наличие записи об оплате
                    if (fetchedCourse.idMonetizationCourse === 2) {
                        const paymentRes = await api.get('/payments/check', {
                            params: { userId: user.idusername, courseId: id }
                        });
                        if (paymentRes.data.success) {
                            setHasPaid(paymentRes.data.hasPaid);
                        } else {
                            setHasPaid(false);
                        }
                    } else {
                        setHasPaid(true);
                    }
                }
            } catch (error) {
                console.error('Error loading course:', error);
                showToast('Ошибка при загрузке курса', 'error');
                navigate('/courses');
            } finally {
                setIsLoading(false);
            }
        };

        loadCourse();
    }, [id, user, navigate, showToast]);

    const handlePayment = async () => {
        if (!course || !user) return;

        try {
            const response = await api.post('/payments', {
                idusername: user.idusername,
                idcourse: course.idCourse
            });

            if (response.data.success) {
                setHasPaid(true);
                setShowPaymentModal(false);
                showToast('Оплата прошла успешно', 'success');
            } else {
                showToast('Неизвестная ошибка при оплате', 'error');
            }
        } catch (error) {
            console.error('Payment error:', error);
            showToast('Неизвестная ошибка при оплате', 'error');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <p className="text-gray-600">Курс не найден</p>
                </div>
            </div>
        );
    }

    // Сортируем страницы (на всякий случай, хотя API уже отдаёт отсортированными)
    const sortedPages = [...course.pages].sort((a, b) => a.numberPage - b.numberPage);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* ---------------------------------- */}
            {/*   Информационная карточка курса   */}
            {/* ---------------------------------- */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-gray-600 mb-4">{course.description}</p>
                        <div className="space-y-2">
                            <p className="flex items-center">
                                <span className="font-medium mr-2">Тип доступа:</span>
                                <span className={`px-2 py-1 rounded-full text-sm ${
                                    course.idMonetizationCourse === 1
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-blue-100 text-blue-800'
                                }`}>
                                    {course.idMonetizationCourse === 1 ? 'Бесплатно' : `${course.price} ₽`}
                                </span>
                            </p>
                            <p>
                                <span className="font-medium">Количество страниц:</span>{' '}
                                {course.pagesCount}
                            </p>
                            <p>
                                <span className="font-medium">Категория:</span> {course.category}
                            </p>
                            <p>
                                <span className="font-medium">Возрастное ограничение:</span>{' '}
                                {course.age}
                            </p>
                            <p>
                                <span className="font-medium">Уровень сложности:</span>{' '}
                                {course.level}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col justify-end">
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => navigate('/courses')}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Отмена
                            </button>

                            {/* Логика рендеринга кнопки */}
                            {(!isOwner && course.idMonetizationCourse === 2 && !hasPaid) ? (
                                // Чужой платный курс без оплаты → показываем «Оплатить»
                                <button
                                    onClick={() => setShowPaymentModal(true)}
                                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                                >
                                    Оплатить
                                </button>
                            ) : (
                                // Либо свой курс, либо бесплатный курс, либо уже оплачен → «Открыть»
                                <button
                                    onClick={() => setCurrentPage(0)}
                                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                                >
                                    Открыть
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ---------------------------------- */}
            {/*   Просмотр содержимого курса      */}
            {/* ---------------------------------- */}
            {(hasPaid || course.idMonetizationCourse === 1 || isOwner) && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    {/* Навигация по страницам */}
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 0}
                            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex space-x-2">
                            {sortedPages.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentPage(index)}
                                    className={`w-8 h-8 rounded-full ${
                                        currentPage === index
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-gray-200 hover:bg-gray-300'
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === sortedPages.length - 1}
                            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Markdown-превью страницы */}
                    <div className="prose max-w-none">
                        <MarkdownPreview source={sortedPages[currentPage]?.fileContent || ''} />
                    </div>
                </div>
            )}

            {/* ---------------------------------- */}
            {/*   Модальное окно оплаты            */}
            {/* ---------------------------------- */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Оплата курса</h3>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Номер карты
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        maxLength={19}
                                        value={paymentData.cardNumber}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                                            setPaymentData({ ...paymentData, cardNumber: formatted });
                                        }}
                                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="0000 0000 0000 0000"
                                    />
                                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Месяц/Год
                                    </label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            minLength={1}
                                            maxLength={2}
                                            value={paymentData.expiryMonth}
                                            onChange={(e) => {
                                                let value = e.target.value.replace(/\D/g, '');

                                                // Удаляем ведущие нули и проверяем диапазон
                                                value = value.replace(/^0+/, '');

                                                if (value === '') {
                                                    setPaymentData({ ...paymentData, expiryMonth: value });
                                                } else {
                                                    const num = parseInt(value, 10);
                                                    // Проверяем диапазон 1-12 и запрещаем 0 в начале
                                                    if (num >= 1 && num <= 12) {
                                                        setPaymentData({ ...paymentData, expiryMonth: value });
                                                    }
                                                }
                                            }}
                                            className="w-16 px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="MM"
                                        />
                                        <span className="flex items-center">/</span>
                                        <input
                                            type="text"
                                            maxLength={4}
                                            value={paymentData.expiryYear}
                                            onChange={(e) => {
                                                let value = e.target.value.replace(/\D/g, '');

                                                // Разрешаем ввод только цифр и ограничиваем длину
                                                if (value.length > 4) return;

                                                // Всегда обновляем состояние для промежуточных значений
                                                setPaymentData(prev => ({ ...prev, expiryYear: value }));

                                                // Проверка полного года (4 цифры)
                                                if (value.length === 4) {
                                                    const year = parseInt(value, 10);
                                                    if (year < 2025 || year > 2100) {
                                                        // Автокоррекция при невалидном годе
                                                        const corrected = Math.min(Math.max(year, 2025), 2100).toString();
                                                        setTimeout(() => {
                                                            setPaymentData(prev => ({ ...prev, expiryYear: corrected }));
                                                        }, 0);
                                                    }
                                                }
                                            }}
                                            className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="YYYY"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        CVC
                                    </label>
                                    <input
                                        type="password"
                                        maxLength={3}
                                        value={paymentData.cvc}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            setPaymentData({ ...paymentData, cvc: value });
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="000"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handlePayment}
                                disabled={!validatePaymentForm()}
                                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                            >
                                Оплатить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseViewPage;
