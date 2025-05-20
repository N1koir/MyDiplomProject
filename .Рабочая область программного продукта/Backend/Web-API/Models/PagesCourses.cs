namespace Web_API.Models
{
    public class PagesCourses
    {
        public long IdPagesCourses { get; set; }
        public string Title { get; set; }
        public short NumberPage { get; set; }
        public byte[] FilePage { get; set; }

        public ICollection<DatasCourses> DatasCourses { get; set; }
        public ICollection<EducationCourses> EducationCourses { get; set; }
    }
}
