using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_DiplomProject.Models
{
    [Table("monetizationcourse")]
    public class MonetizationCourse
    {
        [Key]
        [Column("idmonetizationcourse")]
        public int idmonetizationcourse { get; set; }

        [Column("type")]
        public string type { get; set; }
    }
}
