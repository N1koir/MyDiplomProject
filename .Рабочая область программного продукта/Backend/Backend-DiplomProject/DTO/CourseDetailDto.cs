namespace Backend_DiplomProject.DTO
{
    /// <summary>
    /// Детальная данная о курсе
    /// </summary>
    public class CourseDetailDto
    {
        public long IdCourse { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public int MonetizationType { get; set; }

        public int? Price { get; set; }

        public int Category { get; set; }

        public int AgeRestriction { get; set; }

        public int Level { get; set; }

        public bool HasIcon { get; set; }

        public string? IconBase64 { get; set; }


        public List<PageDetailDto> Pages { get; set; }
    }
}
