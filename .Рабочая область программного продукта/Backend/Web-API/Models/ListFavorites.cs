namespace Web_API.Models
{
    public class ListFavorites
    {
        public long IdOpenCourses { get; set; }
        public OpenCourses OpenCourses { get; set; }

        public long IdUsername { get; set; }
        public Username Username { get; set; }
    }
}
