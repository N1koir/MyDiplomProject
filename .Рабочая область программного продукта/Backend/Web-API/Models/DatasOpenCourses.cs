namespace Web_API.Models
{
    public class DatasOpenCourses
    {
        public long IdDatasOpenCourses { get; set; }
        public string Title { get; set; }
        public byte[] File { get; set; }

        public long IdPagesOpenCourses { get; set; }
        public PagesOpenCourses PagesOpenCourses { get; set; }
    }
}
