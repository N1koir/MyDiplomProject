namespace Backend_DiplomProject.DTO
{
    /// <summary>
    /// Загрузка данных для "Редактор курсов"
    /// </summary>
    public class CourseDto
    {
        public long IdCourse { get; set; }
        public string Title { get; set; }
        public DateTime DateAdd { get; set; }
    }
}