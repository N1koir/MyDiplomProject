namespace Web_API.Models
{
    public class CompletedOpenCourses
    {
        public int IdCompletedOpenCourses { get; set; }
        public string Type { get; set; }

        public ICollection<OpenCourses> OpenCourses { get; set; }
    }
}
