namespace Backend_DiplomProject.DTO
{
    public class CourseListDto
    {
        public long Idcourse { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public string IconBase64 { get; set; }

        public int Idmonetizationcourse { get; set; }

        public string MonetizationType { get; set; }

        public int? Price { get; set; }

        public string Level { get; set; }

        public string Category { get; set; }

        public string Age { get; set; }
    }

}
