using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_DiplomProject.Models
{
    [Table("course")]
    public class Course
    {
        [Key]
        [Column("idcourse")]
        public long Idcourse { get; set; }

        [Column("title")]
        public string Title { get; set; }

        [Column("description")]
        public string Description { get; set; }

        [Column("icon")]
        public byte[] Icon { get; set; }

        [Column("dateadd")]
        public DateTime Dateadd { get; set; }


        [Column("idusername")]
        public long Idusername { get; set; }

        [Column("idmonetizationcourse")]
        public int Idmonetizationcourse { get; set; }

        [Column("idlevelknowledge")]
        public int Idlevelknowledge { get; set; }

        [Column("idcategory")]
        public int Idcategory { get; set; }

        [Column("idagepeople")]
        public int Idagepeople { get; set; }


        public Username User { get; set; }

        public MonetizationCourse Monetization { get; set; }

        public LevelKnowledge Level { get; set; }

        public Category Category { get; set; }

        public AgePeople Age { get; set; }

        /// <summary>
        /// Принудительное подключение к сущности Pages в базе данных
        /// </summary>
        public ICollection<Pages> Pages { get; set; } = new List<Pages>();


    }
}
