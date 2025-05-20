namespace Web_API.Models
{
    public class EducationLicense
    {
        public int IdEducationLicense { get; set; }
        public DateTime DateStart { get; set; }
        public DateTime DateEnd { get; set; }

        public long IdEducationalOrganizations { get; set; }
        public EducationalOrganizations EducationalOrganizations { get; set; }
    }
}
