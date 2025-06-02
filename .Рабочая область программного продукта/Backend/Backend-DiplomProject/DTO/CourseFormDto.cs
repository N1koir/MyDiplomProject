using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace Backend_DiplomProject.DTO
{
    /// <summary>
    /// Создание-редактирования курса
    /// </summary>
    public class CourseFormDto
    {
        [FromForm(Name = "title")]
        [Required]
        public string Title { get; set; }

        [FromForm(Name = "description")]
        public string Description { get; set; }

        [FromForm(Name = "icon")]
        public IFormFile Icon { get; set; }

        [FromForm(Name = "idusername")]
        [Required]
        public long Idusername { get; set; }

        [FromForm(Name = "idmonetizationcourse")]
        [Required]
        public int Idmonetizationcourse { get; set; }

        [FromForm(Name = "price")]
        public int? Price { get; set; }

        [FromForm(Name = "idcategory")]
        [Required]
        public int Idcategory { get; set; }

        [FromForm(Name = "idagepeople")]
        [Required]
        public int Idagepeople { get; set; }

        [FromForm(Name = "idlevelknowledge")]
        [Required]
        public int Idlevelknowledge { get; set; }

        [FromForm(Name = "pages")]
        [Required]
        public string PagesJson { get; set; }
    }
}
