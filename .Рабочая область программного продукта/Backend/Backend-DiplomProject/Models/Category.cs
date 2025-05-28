using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_DiplomProject.Models
{
    [Table("category")]
    public class Category
    {
        [Key]
        [Column("idcategory")]
        public int Idcategory { get; set; }

        [Column("type")]
        public string Type { get; set; }
    }
}
