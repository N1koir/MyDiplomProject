namespace Web_API.Models
{
    public class EducationUserRole
    {
        public int IdEducationUserRole { get; set; }
        public string Title { get; set; }

        public ICollection<EducationUser> EducationUsers { get; set; }
    }
}
