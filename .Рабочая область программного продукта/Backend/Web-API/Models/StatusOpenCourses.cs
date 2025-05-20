namespace Web_API.Models
{
    public class StatusOpenCourses
    {
        public int IdStatusOpenCourses { get; set; }
        public string Type { get; set; }

        public ICollection<OpenCourses> OpenCourses { get; set; }
    }
}
