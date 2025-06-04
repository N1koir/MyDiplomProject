namespace Backend_DiplomProject.DTO
{
    /// <summary>
    /// Страницы для просмотра курсов
    /// </summary>
    public class PageListDto
    {
        public long IdPage { get; set; }
        public int NumberPage { get; set; }
        public string FileContent { get; set; }
    }
}
