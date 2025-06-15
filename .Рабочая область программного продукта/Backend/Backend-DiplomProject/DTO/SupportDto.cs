using System.Text.Json.Serialization;

namespace Backend_DiplomProject.DTO
{
    public class SupportDto
    {
        public int IdTypeSupport { get; set; }

        public string Description { get; set; }

        public long IdCourse { get; set; }

        public long IdUsername { get; set; }

        public int IdTypeStatusSupport { get; set; } = 1;
    }
}