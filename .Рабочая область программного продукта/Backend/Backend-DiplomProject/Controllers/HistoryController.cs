using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_DiplomProject.Models;

namespace Backend_DiplomProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HistoryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HistoryController(AppDbContext context)
        {
            _context = context;
        }


        /// <summary>
        /// Загрузка списка "Истории курсов"
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetHistory([FromQuery] long userId)
        {
            var historyItems = await _context.FavoritesAndHistories
                .Where(f => f.Idusername == userId)
                .Include(f => f.Course)
                .Select(f => new
                {
                    idfavoritesandhistory = f.Idfavoritesandhistory,
                    idcourse = f.Idcourse,
                    viewed = f.Viewed,
                    course = new
                    {
                        idcourse = f.Course.Idcourse,
                        title = f.Course.Title,
                        description = f.Course.Description,
                        idmonetizationcourse = f.Course.Idmonetizationcourse,
                        price = f.Course.Price,
                        iconBase64 = f.Course.Icon != null
                            ? Convert.ToBase64String(f.Course.Icon)
                            : null
                    }
                })
                .ToListAsync();

            return Ok(new { success = true, history = historyItems });
        }
    }
}