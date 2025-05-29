using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend_DiplomProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : Controller
    {
        private readonly AppDbContext _context;

        public CategoryController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("monetization-types")]
        public async Task<IActionResult> GetMonetizationTypes()
        {
            var monetizationTypes = await _context.MonetizationCourses
                .Select(m => new { m.idmonetizationcourse, m.type })
                .ToListAsync();

            return Ok(new { success = true, monetizationTypes });
        }

        [HttpGet("levels")]
        public async Task<IActionResult> GetLevels()
        {
            var levels = await _context.LevelKnowledges
                .Select(l => new { l.Idlevelknowledge, l.Type })
                .ToListAsync();

            return Ok(new { success = true, levels });
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories
                .Select(c => new { c.Idcategory, c.Type })
                .ToListAsync();

            return Ok(new { success = true, categories });
        }

        [HttpGet("age-restrictions")]
        public async Task<IActionResult> GetAgeRestrictions()
        {
            var ageRestrictions = await _context.AgePeoples
                .Select(a => new { a.Idagepeople, a.Type })
                .ToListAsync();

            return Ok(new { success = true, ageRestrictions });
        }
    }
}
