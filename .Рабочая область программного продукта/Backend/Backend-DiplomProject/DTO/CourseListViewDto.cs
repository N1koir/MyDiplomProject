namespace Backend_DiplomProject.DTO
{
    public class CourseListViewDto
    {
        public long IdCourse { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int IdMonetizationCourse { get; set; }
        public int? Price { get; set; }
        public int PagesCount { get; set; }
        public string Category { get; set; }
        public string Age { get; set; }
        public string Level { get; set; }


        // Список страниц, отсортированных по NumberPage
        public List<PageListDto> Pages { get; set; }
    }
}
