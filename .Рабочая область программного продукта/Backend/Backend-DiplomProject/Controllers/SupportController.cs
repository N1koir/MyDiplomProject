using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.EntityFrameworkCore;
using Backend_DiplomProject.Models;
using Backend_DiplomProject.DTO;

namespace Backend_DiplomProject.Controllers
{
    [ApiController]
    [Route("api/support")]
    public class SupportController : ControllerBase
    {
        private readonly AppDbContext _context;
        public SupportController(AppDbContext context) => _context = context;

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SupportDto dto)
        {
            if (dto == null)
                return BadRequest(new { success = false, message = "Данные не были переданы." });

            // Валидация по новым свойствам
            if (dto.IdTypeSupport <= 0 || dto.IdCourse <= 0 || dto.IdUsername <= 0 || string.IsNullOrWhiteSpace(dto.Description))
                return BadRequest(new { success = false, message = "Некорректные данные запроса." });

            // Проверки существования
            var typeExists = await _context.TypeSupports.AnyAsync(t => t.Idtypesupport == dto.IdTypeSupport);
            var courseExists = await _context.Courses.AnyAsync(c => c.Idcourse == dto.IdCourse);
            var userExists = await _context.Usernames.AnyAsync(u => u.Idusername == dto.IdUsername);
            var statusExists = await _context.TypeStatusSupports.AnyAsync(s => s.Idtypestatussupport == dto.IdTypeStatusSupport);

            if (!typeExists || !courseExists || !userExists || !statusExists)
                return NotFound(new { success = false, message = "Связанная сущность не найдена." });

            var support = new Support
            {
                Idtypesupport = dto.IdTypeSupport,
                Description = dto.Description.Trim(),
                Idcourse = dto.IdCourse,
                Idusername = dto.IdUsername,
                Idtypestatussupport = dto.IdTypeStatusSupport
            };
            _context.Supports.Add(support);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, supportId = support.Idsupport });
        }
    }
}