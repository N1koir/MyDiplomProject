using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_DiplomProject.Models
{
    [Table("username")]
    public class Username
    {
        [Key]
        [Column("idusername")]
        public long Idusername { get; set; }

        [Column("login")]
        public string Login { get; set; }

        [Column("password")]
        public string Password { get; set; }

        [Column("dateaddaccount")]
        public DateTime Dateaddaccount { get; set; }

        [Column("idrole")]
        public int Idrole { get; set; }

        public Role Role { get; set; }
    }
}
