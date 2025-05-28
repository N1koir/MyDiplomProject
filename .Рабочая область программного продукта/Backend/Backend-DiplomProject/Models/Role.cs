using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_DiplomProject.Models
{
    [Table("role")]
    public class Role
    {
        [Key]
        [Column("idrole")]
        public int Idrole { get; set; }

        [Column("title")]
        public string Title { get; set; }
    }
}
