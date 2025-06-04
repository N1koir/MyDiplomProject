import { useEffect, useState } from 'react';

const LoadingScreen = () => {
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        // Показываем сообщение об ошибке после 5 секунд неудачных попыток
        const timer = setTimeout(() => {
            setShowError(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex flex-col items-center justify-center z-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mb-4"></div>
            {showError ? (

                <p className="text-white text-xl text-center px-4">
                    <p className="text-white text-xl text-center px-4">
                        Загрузка...
                    </p>
                    <p className="text-white text-xl text-center px-4">
                        Нет подключения к серверу
                    </p>
                </p>
            ) : (
                <p className="text-white text-xl text-center px-4">
                    Загрузка...
                </p>
            )}
        </div>
    );
};

export default LoadingScreen;