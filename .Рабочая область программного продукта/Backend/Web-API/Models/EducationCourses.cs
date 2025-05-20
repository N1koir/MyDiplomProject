namespace Web_API.Models
{
    public class EducationCourses
    {
        public long IdEducationCourses { get; set; }
        public string Title { get; set; }
        public short NumberPage { get; set; }
        public byte[] FileIcon { get; set; }
        public DateTime DateAdd { get; set; }

        public long IdPagesCourses { get; set; }
        public PagesCourses PagesCourses { get; set; }

        public int IdEducationCategory { get; set; }
        public EducationCategory EducationCategory { get; set; }

        public long IdEducationUser { get; set; }
        public EducationUser EducationUser { get; set; }

        public ICollection<EducationList> EducationLists { get; set; }
    }
}
