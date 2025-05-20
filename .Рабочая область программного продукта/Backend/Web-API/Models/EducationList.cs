namespace Web_API.Models
{
    public class EducationList
    {
        public long IdEducationCourses { get; set; }
        public EducationCourses EducationCourses { get; set; }

        public long IdEducationUser { get; set; }
        public EducationUser EducationUser { get; set; }
    }
}
