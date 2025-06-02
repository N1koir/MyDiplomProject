namespace Backend_DiplomProject.Models.SystemModels
{
    // Модель для ответа API
    public class ApiResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public long? CourseId { get; set; } // idcourse из таблицы course
    }
}
