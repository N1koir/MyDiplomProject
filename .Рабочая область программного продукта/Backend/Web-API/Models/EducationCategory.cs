namespace Web_API.Models
{
    public class EducationCategory
    {
        public int IdEducationCategory { get; set; }
        public string Title { get; set; }

        public ICollection<EducationCourses> EducationCourses { get; set; }
    }
}
