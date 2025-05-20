namespace Web_API.Models
{
    public class EducationUser
    {
        public long IdEducationUser { get; set; }
        public DateTime DateAdd { get; set; }

        public long IdEducationalOrganizations { get; set; }
        public EducationalOrganizations EducationalOrganizations { get; set; }

        public long IdUsername { get; set; }
        public Username Username { get; set; }

        public int IdEducationUserRole { get; set; }
        public EducationUserRole EducationUserRole { get; set; }

        public ICollection<EducationCourses> EducationCourses { get; set; }
        public ICollection<EducationList> EducationLists { get; set; }
    }
}
