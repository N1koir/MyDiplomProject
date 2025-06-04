using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_DiplomProject.DTO;
using Backend_DiplomProject.Models;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Backend_DiplomProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CoursesController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Получить курс по ID, включая список страниц.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCourseById(long id)
        {
            // Забираем курс вместе с навигацией: Monetization, Level, Category, Age и Pages
            var course = await _context.Courses
                .Include(c => c.Monetization)
                .Include(c => c.Level)
                .Include(c => c.Category)
                .Include(c => c.Age)
                .Include(c => c.Pages)
                .FirstOrDefaultAsync(c => c.Idcourse == id);

            if (course == null)
            {
                return NotFound(new { success = false, message = "Курс не найден" });
            }

            // Маппим в DTO
            var dto = new CourseListViewDto
            {
                IdCourse = course.Idcourse,
                Title = course.Title,
                Description = course.Description,
                IdMonetizationCourse = course.Idmonetizationcourse,
                Price = course.Price,
                PagesCount = course.Pages.Count,
                Category = course.Category.Type,
                Age = course.Age.Type,
                Level = course.Level.Type,
                Pages = course.Pages
                    .OrderBy(p => p.Numberpage)
                    .Select(p => new PageListDto
                    {
                        IdPage = p.Idpages,
                        NumberPage = p.Numberpage,
                        // Конвертируем byte[] (Bytea) в строку UTF8
                        FileContent = p.File == null
                            ? string.Empty
                            : Encoding.UTF8.GetString(p.File)
                    })
                    .ToList()
            };

            return Ok(new { success = true, course = dto });
        }
    }
}
