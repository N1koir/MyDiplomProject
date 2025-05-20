using System.Xml.Linq;

namespace Web_API.Models
{
    public class OpenCourses
    {
        public long IdOpenCourses { get; set; }
        public string Title { get; set; }
        public short NumberPage { get; set; }
        public byte[] AvatarCourses { get; set; }
        public int? Price { get; set; }

        public long IdPagesOpenCourses { get; set; }
        public PagesOpenCourses PagesOpenCourses { get; set; }

        public int IdOpenCategory { get; set; }
        public OpenCategory OpenCategory { get; set; }

        public int IdCompletedOpenCourses { get; set; }
        public CompletedOpenCourses CompletedOpenCourses { get; set; }

        public int IdMonetizationStatus { get; set; }
        public MonetizationStatus MonetizationStatus { get; set; }

        public int IdStatusOpenCourses { get; set; }
        public StatusOpenCourses StatusOpenCourses { get; set; }

        public long IdUsername { get; set; }
        public Username Username { get; set; }

        public ICollection<Comments> Comments { get; set; }
        public ICollection<ListFavorites> ListFavorites { get; set; }
    }
}
