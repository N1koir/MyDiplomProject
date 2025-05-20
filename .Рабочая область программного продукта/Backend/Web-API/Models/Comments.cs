namespace Web_API.Models
{
    public class Comments
    {
        public long IdComments { get; set; }
        public string Descriptions { get; set; }
        public int CountStart { get; set; }

        public long IdOpenCourses { get; set; }
        public OpenCourses OpenCourses { get; set; }

        public long IdUsername { get; set; }
        public Username Username { get; set; }
    }
}
