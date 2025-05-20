namespace Web_API.Models
{
    public class OpenCategory
    {
        public int IdOpenCategory { get; set; }
        public string Title { get; set; }

        public ICollection<OpenCourses> OpenCourses { get; set; }
    }
}
