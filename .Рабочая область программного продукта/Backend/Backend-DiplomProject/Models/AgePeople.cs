using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_DiplomProject.Models
{
    [Table("agepeople")]
    public class AgePeople
    {
        [Key]
        [Column("idagepeople")]
        public int Idagepeople { get; set; }

        [Column("type")]
        public string Type { get; set; }
    }
}
