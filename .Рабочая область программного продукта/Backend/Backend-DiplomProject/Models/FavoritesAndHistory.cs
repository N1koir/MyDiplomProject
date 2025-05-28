using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_DiplomProject.Models
{
    [Table("favoritesandhistory")]
    public class FavoritesAndHistory
    {
        [Key]
        [Column("idfavoritesanhistory")]
        public int Idfavoritesandhistory { get; set; }

        [Column("viewed")]
        public int Viewed { get; set; }


        [Column("idcourse")]
        public long Idcourse { get; set; }

        [Column("idusername")]
        public long Idusername { get; set; }


        public Course Course { get; set; }

        public Username User { get; set; }
    }
}
