import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { ChevronLeft, ChevronRight, CreditCard, X, AlertTriangle } from 'lucide-react';
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
    idMonetizationCourse: number;
    price?: number;
    pagesCount: number;
    category: string;
    age: string;
    level: string;
    authorId: number;
    pages: PageListDto[];
}

interface PaymentFormData {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvc: string;
}

interface TypeSupport {
    idtypesupport: number;
    type: string;
}

interface ComplaintFormData {
    typeId: number;
    description: string;
}

const CourseViewPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [course, setCourse] = useState<CourseListViewDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasPaid, setHasPaid] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showComplaintModal, setShowComplaintModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);

    const [paymentData, setPaymentData] = useState<PaymentFormData>({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvc: ''
    });

    const [supportTypes, setSupportTypes] = useState<TypeSupport[]>([]);
    const [complaintData, setComplaintData] = useState<ComplaintFormData>({ typeId: 0, description: '' });
    const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);

    // Валидация формы оплаты
    const validatePaymentForm = () => {
        const year = parseInt(paymentData.expiryYear);
        const month = parseInt(paymentData.expiryMonth);
        return (
            paymentData.cardNumber.replace(/\s/g, '').length === 16 &&
            /^\d+$/.test(paymentData.cardNumber.replace(/\s/g, '')) &&
            paymentData.cvc.length === 3 &&
            /^\d+$/.test(paymentData.cvc) &&
            year >= 2025 && year <= 2100 &&
            month >= 1 && month <= 12
        );
    };

    // Валидация формы жалобы
    const validateComplaintForm = () => {
        return complaintData.typeId > 0 && complaintData.description.trim().length > 0;
    };

    // Загрузка типов поддержки
    useEffect(() => {
        const loadSupportTypes = async () => {
            try {
                const response = await api.get('/support/types');
                if (response.data.success) setSupportTypes(response.data.types);
            } catch (error) {
                console.error('Ошибка загрузки типов для жалоб:', error);
            }
        };
        loadSupportTypes();
    }, []);

    // Загрузка данных курса + проверка оплаты
    useEffect(() => {
        const loadCourse = async () => {
            if (!id || !user) return;
            try {
                setIsLoading(true);
                const courseRes = await api.get(`/courses/${id}`);
                if (!courseRes.data.success) {
                    showToast('Курс не найден', 'error');
                    navigate('/courses');
                    return;
                }
                const fetched: CourseListViewDto = courseRes.data.course;
                setCourse(fetched);
                if (fetched.idMonetizationCourse === 2 && fetched.authorId !== user.idusername) {
                    const paymentRes = await api.get('/payments/check', {
                        params: { userId: user.idusername, courseId: id }
                    });
                    setHasPaid(paymentRes.data.success && paymentRes.data.hasPaid);
                } else {
                    setHasPaid(true);
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

    // Отправка оплаты на сервер
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
            } else showToast('Неизвестная ошибка при оплате', 'error');
        } catch (error) {
            console.error('Payment error:', error);
            showToast('Неизвестная ошибка при оплате', 'error');
        }
    };

    // Отправка жалобы на сервер
    const handleComplaint = async () => {
        if (!course || !user || !validateComplaintForm()) return;
        try {
            setIsSubmittingComplaint(true);
            const response = await api.post('/support', {
                IdTypeSupport: complaintData.typeId,
                Description: complaintData.description,
                IdCourse: course.idCourse,
                IdUsername: user.idusername,
                IdTypeStatusSupport: 1,
            });
            if (response.data.success) {
                showToast('Жалоба отправлена', 'success');
                setShowComplaintModal(false);
                setComplaintData({ typeId: 0, description: '' });
            } else showToast('Проблема с сервером', 'error');
        } catch (error) {
            console.error('Complaint error:', error);
            showToast('Проблема с сервером', 'error');
        } finally {
            setIsSubmittingComplaint(false);
        }
    };

    // Логика изменения кнопки
    const getActionButton = () => {
        if (course?.idMonetizationCourse === 2 && !hasPaid) {
            return (
                <button
                    onClick={() => setShowPaymentModal(true)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                    Оплатить
                </button>
            );
        }
        return (
            <button
                onClick={() => setShowComplaintModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
            >
                <AlertTriangle size={16} className="mr-1" />
                Пожаловаться
            </button>
        );
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
                <p className="text-center text-gray-600">Курс не найден</p>
            </div>
        );
    }

    const sortedPages = [...course.pages].sort((a, b) => a.numberPage - b.numberPage);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Карточка курса */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-gray-600 mb-4">{course.description}</p>
                        <div className="space-y-2">
                            <p className="flex items-center">
                                <span className="font-medium mr-2">Тип доступа:</span>
                                <span className={`px-2 py-1 rounded-full text-sm ${
                                    course.idMonetizationCourse === 1 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                    {course.idMonetizationCourse === 1 ? 'Бесплатно' : `${course.price} ₽`}
                                </span>
                            </p>
                            <p><span className="font-medium">Страниц:</span> {course.pagesCount}</p>
                            <p><span className="font-medium">Категория:</span> {course.category}</p>
                            <p><span className="font-medium">Возраст:</span> {course.age}</p>
                            <p><span className="font-medium">Уровень:</span> {course.level}</p>
                        </div>
                    </div>
                    <div className="flex flex-col justify-end">
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => navigate('/courses')} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Отмена</button>
                            {getActionButton()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Контент курса */}
            {(hasPaid || course.idMonetizationCourse === 1) && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    {/* Навигация по страницам */}
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
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
                                        currentPage === index ? 'bg-orange-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, sortedPages.length - 1))}
                            disabled={currentPage === sortedPages.length - 1}
                            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    <div className="prose max-w-none">
                        <MarkdownPreview source={sortedPages[currentPage]?.fileContent || ''} />
                    </div>
                </div>
            )}

            {/* Модалка оплаты */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Оплата курса</h3>
                            <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-500">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Номер карты</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        maxLength={19}
                                        value={paymentData.cardNumber}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/\D/g, '');
                                            const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
                                            setPaymentData({ ...paymentData, cardNumber: formatted });
                                        }}
                                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="0000 0000 0000 0000" />
                                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Месяц/Год</label>
                                    <div className="flex space-x-2">
                                        <input type="text" minLength={1} maxLength={2} value={paymentData.expiryMonth} onChange={(e) => {
                                            let v = e.target.value.replace(/\D/g, '');
                                            if (v === '' || (+v >= 1 && +v <= 12)) setPaymentData({ ...paymentData, expiryMonth: v });
                                        }} className="w-16 px-3 py-2 border border-gray-300 rounded-md" placeholder="MM" />
                                        <span className="flex items-center">/</span>
                                        <input type="text" maxLength={4} value={paymentData.expiryYear} onChange={(e) => {
                                            let v = e.target.value.replace(/\D/g, '');
                                            if (v.length <= 4) setPaymentData({ ...paymentData, expiryYear: v });
                                        }} className="w-20 px-3 py-2 border border-gray-300 rounded-md" placeholder="YYYY" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                                    <input type="password" maxLength={3} value={paymentData.cvc} onChange={(e) => {
                                        const v = e.target.value.replace(/\D/g, '');
                                        setPaymentData({ ...paymentData, cvc: v });
                                    }} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="000" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={() => setShowPaymentModal(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Отмена</button>
                            <button onClick={handlePayment} disabled={!validatePaymentForm()} className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50">Оплатить</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модалка жалобы */}
            {showComplaintModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium flex items-center"><AlertTriangle size={20} className="mr-2 text-red-500" />Подать жалобу</h3>
                            <button onClick={() => { setShowComplaintModal(false); setComplaintData({ typeId: 0, description: '' }); }} className="text-gray-400 hover:text-gray-500"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Причина жалобы</label>
                                <select value={complaintData.typeId} onChange={(e) => setComplaintData({ ...complaintData, typeId: +e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                                    <option value={0}>Выберите причину</option>
                                    {supportTypes.map(type => <option key={type.idtypesupport} value={type.idtypesupport}>{type.type}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Описание жалобы</label>
                                <textarea value={complaintData.description} onChange={(e) => setComplaintData({ ...complaintData, description: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Опишите вашу жалобу подробно..." />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={() => { setShowComplaintModal(false); setComplaintData({ typeId: 0, description: '' }); }} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Отмена</button>
                            <button onClick={handleComplaint} disabled={!validateComplaintForm() || isSubmittingComplaint} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center">
                                {isSubmittingComplaint ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />Отправка...</> : <><AlertTriangle size={16} className="mr-1" />Отправить жалобу</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseViewPage;
