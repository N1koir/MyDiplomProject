using System.Xml.Linq;

namespace Web_API.Models
{
    public class Username
    {
        public long IdUsername { get; set; }
        public string Surname { get; set; }
        public string Name { get; set; }
        public string Middlename { get; set; }
        public DateTime Age { get; set; }
        public DateTime DateAddAccount { get; set; }
        public string Login { get; set; }
        public string Password { get; set; }
        public byte[] Avatar { get; set; }
        public DateTime DateOnlineLast { get; set; }

        public int IdRole { get; set; }
        public Role Role { get; set; }

        public ICollection<OpenCourses> OpenCourses { get; set; }
        public ICollection<Comments> Comments { get; set; }
        public ICollection<ListFavorites> ListFavorites { get; set; }
        public ICollection<EducationUser> EducationUsers { get; set; }
    }
}
