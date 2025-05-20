namespace Web_API.Models
{
    public class EducationalOrganizations
    {
        public long IdEducationalOrganizations { get; set; }
        public byte[] Avatar { get; set; }
        public string Name { get; set; }
        public long INN { get; set; }
        public string Region { get; set; }
        public string City { get; set; }
        public string Street { get; set; }
        public long NumberPhone { get; set; }
        public string Email { get; set; }
        public DateTime DateAdd { get; set; }

        public ICollection<EducationLicense> EducationLicenses { get; set; }
        public ICollection<EducationUser> EducationUsers { get; set; }
    }
}
