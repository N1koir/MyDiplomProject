using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_DiplomProject.Models;
using System.Threading.Tasks;
using Backend_DiplomProject.DTO;

namespace Backend_DiplomProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PaymentsController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Проверить, есть ли запись об оплате для данного пользователя и курса.
        /// </summary>
        [HttpGet("check")]
        public async Task<IActionResult> CheckPaymentStatus([FromQuery] long userId, [FromQuery] long courseId)
        {
            var hasPaid = await _context.Pays.AnyAsync(p => p.Idusername == userId && p.Idcourse == courseId);
            return Ok(new { success = true, hasPaid });
        }

        /// <summary>
        /// Сохранить оплату: добавить новую запись в таблицу Pays.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> MakePayment([FromBody] PaymentRequestDto paymentDto)
        {
            // Дополнительно можно проверить: существует ли пользователь, существует ли курс, не оплатил ли он уже раньше
            var alreadyPaid = await _context.Pays.AnyAsync(p =>
                p.Idusername == paymentDto.Idusername && p.Idcourse == paymentDto.Idcourse);

            if (alreadyPaid)
            {
                return BadRequest(new { success = false, message = "Курс уже оплачен" });
            }

            var userExists = await _context.Usernames.AnyAsync(u => u.Idusername == paymentDto.Idusername);
            var courseExists = await _context.Courses.AnyAsync(c => c.Idcourse == paymentDto.Idcourse);

            if (!userExists || !courseExists)
            {
                return BadRequest(new { success = false, message = "Пользователь или курс не найдены" });
            }

            var pay = new Pay
            {
                Idusername = paymentDto.Idusername,
                Idcourse = paymentDto.Idcourse
            };

            _context.Pays.Add(pay);

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { success = true });
            }
            catch
            {
                return StatusCode(500, new { success = false, message = "Неизвестная ошибка при сохранении оплаты" });
            }
        }
    }
}
