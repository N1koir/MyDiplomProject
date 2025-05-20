using System.ComponentModel.DataAnnotations.Schema;

namespace Web_API.Models
{
    [Table("role")]
    public class Role
    {
        [Column("idrole")]
        public int IdRole { get; set; }

        [Column("title")]
        public string Title { get; set; }

        public ICollection<Username> Usernames { get; set; }
    }
}
