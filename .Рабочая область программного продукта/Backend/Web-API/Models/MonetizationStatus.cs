namespace Web_API.Models
{
    public class MonetizationStatus
    {
        public int IdMonetizationStatus { get; set; }
        public string Type { get; set; }

        public ICollection<OpenCourses> OpenCourses { get; set; }
    }
}
