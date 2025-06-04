import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { ChevronLeft, ChevronRight, CreditCard, X } from 'lucide-react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { api } from '../../services/api';

interface Course {
    idcourse: number;
    title: string;
    description: string;
    idmonetizationcourse: number;
    price?: number;
    pages: {
        idpage: number;
        numberpage: number;
        file: string;
    }[];
    category: string;
    age: string;
    level: string;
}

interface PaymentFormData {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvc: string;
}

const CourseViewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasPaid, setHasPaid] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);

    // Поля для оплаты
    const [paymentData, setPaymentData] = useState<PaymentFormData>({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvc: ''
    });

    // Форма валидации для оплаты
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
            (year > 2025 || (year === 2025 && month >= 6)) &&
            month >= 1 &&
            month <= 12
        );
    };

    // Загрузка данных курсов и проверка оплаты
    useEffect(() => {
        const loadCourse = async () => {
            if (!id || !user) return;

            try {
                setIsLoading(true);
                const [courseRes, paymentRes] = await Promise.all([
                    api.get(`/courses/${id}`),
                    api.get('/payments/check', {
                        params: { userId: user.idusername, courseId: id }
                    })
                ]);

                if (courseRes.data.success) {
                    setCourse(courseRes.data.course);
                }

                if (paymentRes.data.success) {
                    setHasPaid(paymentRes.data.hasPaid);
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
    }, [id, user]);

    // Оплата курса
    const handlePayment = async () => {
        if (!course || !user) return;

        try {
            const response = await api.post('/payments', {
                idusername: user.idusername,
                idcourse: course.idcourse
            });

            if (response.data.success) {
                setHasPaid(true);
                setShowPaymentModal(false);
                showToast('Оплата прошла успешно', 'success');
            } else {
                showToast('Неизвестная ошибка', 'error');
            }
        } catch (error) {
            console.error('Payment error:', error);
            showToast('Неизвестная ошибка', 'error');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    // Поисковик
    if (!course) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <p className="text-gray-600">Курс не найден</p>
                </div>
            </div>
        );
    }

    // Сортировка страниц
    const sortedPages = [...course.pages].sort((a, b) => a.numberpage - b.numberpage);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Course Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-gray-600 mb-4">{course.description}</p>
                        <div className="space-y-2">
                            <p className="flex items-center">
                                <span className="font-medium mr-2">Тип доступа:</span>
                                <span className={`px-2 py-1 rounded-full text-sm ${
                                    course.idmonetizationcourse === 1
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-blue-100 text-blue-800'
                                }`}>
                  {course.idmonetizationcourse === 1 ? 'Бесплатно' : `${course.price} ₽`}
                </span>
                            </p>
                            <p>
                                <span className="font-medium">Количество страниц:</span>{' '}
                                {course.pages.length}
                            </p>
                            <p>
                                <span className="font-medium">Категория:</span>
                                {course.category}
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
                            {course.idmonetizationcourse === 2 && !hasPaid ? (
                                <button
                                    onClick={() => setShowPaymentModal(true)}
                                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                                >
                                    Оплатить
                                </button>
                            ) : (
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

            {/* Контент курсов */}
            {(hasPaid || course.idmonetizationcourse === 1) && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    {/* Навигация */}
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

                    {/* Контент */}
                    <div className="prose max-w-none">
                        <MarkdownPreview source={sortedPages[currentPage]?.file || ''} />
                    </div>

                </div>
            )}

            {/* Модель оплаты */}
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
                                            maxLength={2}
                                            value={paymentData.expiryMonth}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                if (parseInt(value) <= 12 || value === '') {
                                                    setPaymentData({ ...paymentData, expiryMonth: value });
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
                                                const value = e.target.value.replace(/\D/g, '');
                                                setPaymentData({ ...paymentData, expiryYear: value });
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