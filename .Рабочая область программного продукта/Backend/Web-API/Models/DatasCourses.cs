namespace Web_API.Models
{
    public class DatasCourses
    {
        public long IdDatasOpenCourses { get; set; }
        public string Title { get; set; }
        public byte[] File { get; set; }

        public long IdPagesCourses { get; set; }
        public PagesCourses PagesCourses { get; set; }
    }
}
