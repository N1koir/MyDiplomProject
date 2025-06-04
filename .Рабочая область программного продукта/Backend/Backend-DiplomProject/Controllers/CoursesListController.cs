using Backend_DiplomProject.DTO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend_DiplomProject.Controllers
{
    /// <summary>
    /// Загрузка списка страниц
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesListController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CoursesListController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Поисковая система и использование фильтров
        /// </summary>
        /// <param name="searchQuery"></param>
        /// <param name="selectedCategory"></param>
        /// <param name="selectedAge"></param>
        /// <param name="selectedLevel"></param>
        /// <param name="selectedMonetization"></param>
        /// <param name="priceMin"></param>
        /// <param name="priceMax"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetFilteredCourses(
            [FromQuery] string? searchQuery,
            [FromQuery] int? selectedCategory,
            [FromQuery] int? selectedAge,
            [FromQuery] int? selectedLevel,
            [FromQuery] int? selectedMonetization,
            [FromQuery] int? priceMin,
            [FromQuery] int? priceMax
        )
        {
            var query = _context.Courses
                .Include(c => c.Monetization)
                .Include(c => c.Level)
                .Include(c => c.Category)
                .Include(c => c.Age)
                .AsQueryable();

            // Поисковкая строка
            if (!string.IsNullOrWhiteSpace(searchQuery))
            {
                var trimmed = searchQuery.Trim();
                var pattern = $"%{trimmed}%";
                query = query.Where(c =>
                    EF.Functions.ILike(c.Title, pattern)
                );
            }

            if (selectedCategory.HasValue)
            {
                query = query.Where(c => c.Idcategory == selectedCategory.Value);
            }

            if (selectedAge.HasValue)
            {
                query = query.Where(c => c.Idagepeople == selectedAge.Value);
            }

            if (selectedLevel.HasValue)
            {
                query = query.Where(c => c.Idlevelknowledge == selectedLevel.Value);
            }

            if (selectedMonetization.HasValue)
            {
                query = query.Where(c => c.Idmonetizationcourse == selectedMonetization.Value);
            }

            // Ценовой фильтр
            if (selectedMonetization == 2 && priceMin.HasValue && priceMax.HasValue)
            {
                query = query.Where(c =>
                    c.Price.HasValue &&
                    c.Price.Value >= priceMin.Value &&
                    c.Price.Value <= priceMax.Value
                );
            }

            // Проекция в DTO, выполнение запроса
            var result = await query
                .Select(c => new CourseListDto
                {
                    Idcourse = c.Idcourse,
                    Title = c.Title,
                    Description = c.Description,

                    Idmonetizationcourse = c.Idmonetizationcourse,
                    MonetizationType = c.Monetization.type,

                    Price = c.Price,

                    Level = c.Level.Type,
                    Category = c.Category.Type,
                    Age = c.Age.Type,

                    IconBase64 = c.Icon != null ? "data:image/png;base64," + Convert.ToBase64String(c.Icon) : null
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                courses = result
            });
        }
    }
}
