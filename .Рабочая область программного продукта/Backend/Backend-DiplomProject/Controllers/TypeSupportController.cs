using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.EntityFrameworkCore;
using Backend_DiplomProject.Models;

namespace Backend_DiplomProject.Controllers
{
    /// <summary>
    /// Загрузка типов жалобы
    /// </summary>
    [ApiController]
    [Route("api/support/types")]
    public class SupportTypesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public SupportTypesController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            try
            {
                var types = await _context.TypeSupports
                    .AsNoTracking()
                    .Select(ts => new { ts.Idtypesupport, ts.Type })
                    .ToListAsync();

                return Ok(new { success = true, types });
            }
            catch
            {
                return StatusCode(500, new { success = false, message = "Ошибка сервера при получении типов жалоб." });
            }
        }
    }
}