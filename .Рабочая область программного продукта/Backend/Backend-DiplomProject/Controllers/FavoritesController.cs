using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_DiplomProject.Models;
using Backend_DiplomProject.DTO;

namespace Backend_DiplomProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FavoritesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FavoritesController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Получение записи избранных
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetFavorites([FromQuery] long userId)
        {
            var list = await _context.FavoritesAndHistories
                .Where(f => f.Idusername == userId)
                .Select(f => new FavoriteDto
                {
                    Idcourse = f.Idcourse,
                    Viewed = f.Viewed
                })
                .ToListAsync();

            return Ok(new { success = true, favorites = list });
        }

        /// <summary>
        /// Обновление записи избранных и истории
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> UpsertFavorite([FromBody] FavoriteRequestDto dto)
        {
            var existing = await _context.FavoritesAndHistories
                .FirstOrDefaultAsync(f =>
                    f.Idusername == dto.Idusername &&
                    f.Idcourse == dto.Idcourse);

            if (existing != null)
            {
                existing.Viewed = dto.Viewed;
                _context.FavoritesAndHistories.Update(existing);
            }
            else
            {
                var newFav = new FavoritesAndHistory
                {
                    Idusername = dto.Idusername,
                    Idcourse = dto.Idcourse,
                    Viewed = dto.Viewed
                };
                _context.FavoritesAndHistories.Add(newFav);
            }

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { success = true });
            }
            catch
            {
                return StatusCode(500, new { success = false, message = "Не удалось обновить избранное" });
            }
        }
    }
}
