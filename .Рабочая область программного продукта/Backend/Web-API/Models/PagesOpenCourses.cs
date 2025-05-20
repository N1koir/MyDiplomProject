namespace Web_API.Models
{
    public class PagesOpenCourses
    {
        public long IdPagesOpenCourses { get; set; }
        public string Title { get; set; }
        public short NumberPage { get; set; }
        public byte[] FilePage { get; set; }

        public ICollection<DatasOpenCourses> DatasOpenCourses { get; set; }
        public ICollection<OpenCourses> OpenCourses { get; set; }
    }
}
