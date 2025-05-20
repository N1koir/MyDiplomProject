using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Web_API.Models;

namespace Web_API.Controllers.Tests
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class TestRolesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TestRolesController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Получить весь список ролей
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [ProducesResponseType(typeof(List<Role>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll()
        {
            var roles = await _context.Roles
                .AsNoTracking()
                .ToListAsync();

            return Ok(roles);
        }

        /// <summary>
        /// Получить роль по Id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Role), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var role = await _context.Roles
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.IdRole == id);

            return role == null ? NotFound() : Ok(role);
        }
    }
}
