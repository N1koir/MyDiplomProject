using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_DiplomProject.Models
{
    [Table("levelknowledge")]
    public class LevelKnowledge
    {
        [Key]
        [Column("idlevelknowledge")]
        public int Idlevelknowledge { get; set; }

        [Column("type")]
        public string Type { get; set; }
    }
}
