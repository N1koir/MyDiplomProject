using Backend_DiplomProject.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend_DiplomProject.Controllers.Swagger
{
    [Route("api/[controller]")]
    [ApiController]
    public class SupportController_Swagger : ControllerBase
    {
        private readonly AppDbContext _context;

        public SupportController_Swagger(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Support
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Support>>> GetSupports()
        {
            return await _context.Supports
                .Include(s => s.TypeSupport)
                .Include(s => s.TypeStatusSupport)
                .Include(s => s.Course)
                .Include(s => s.User)
                .ToListAsync();
        }

        // GET: api/Support/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Support>> GetSupport(int id)
        {
            var support = await _context.Supports
                .Include(s => s.TypeSupport)
                .Include(s => s.TypeStatusSupport)
                .Include(s => s.Course)
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Idsupport == id);

            if (support == null)
            {
                return NotFound();
            }

            return support;
        }

        // POST: api/Support
        [HttpPost]
        public async Task<ActionResult<Support>> PostSupport(Support support)
        {
            // Проверка существования связанных сущностей
            if (!await _context.TypeSupports.AnyAsync(t => t.Idtypesupport == support.Idtypesupport))
                return BadRequest("Invalid TypeSupport ID");

            if (!await _context.TypeStatusSupports.AnyAsync(t => t.Idtypestatussupport == support.Idtypestatussupport))
                return BadRequest("Invalid TypeStatusSupport ID");

            if (!await _context.Courses.AnyAsync(c => c.Idcourse == support.Idcourse))
                return BadRequest("Invalid Course ID");

            if (!await _context.Usernames.AnyAsync(u => u.Idusername == support.Idusername))
                return BadRequest("Invalid Username ID");

            _context.Supports.Add(support);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSupport", new { id = support.Idsupport }, support);
        }

        // PUT: api/Support/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSupport(int id, Support support)
        {
            if (id != support.Idsupport)
            {
                return BadRequest();
            }

            // Проверка существования связанных сущностей
            if (!await _context.TypeSupports.AnyAsync(t => t.Idtypesupport == support.Idtypesupport))
                return BadRequest("Invalid TypeSupport ID");

            if (!await _context.TypeStatusSupports.AnyAsync(t => t.Idtypestatussupport == support.Idtypestatussupport))
                return BadRequest("Invalid TypeStatusSupport ID");

            if (!await _context.Courses.AnyAsync(c => c.Idcourse == support.Idcourse))
                return BadRequest("Invalid Course ID");

            if (!await _context.Usernames.AnyAsync(u => u.Idusername == support.Idusername))
                return BadRequest("Invalid Username ID");

            _context.Entry(support).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SupportExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Support/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSupport(int id)
        {
            var support = await _context.Supports.FindAsync(id);
            if (support == null)
            {
                return NotFound();
            }

            _context.Supports.Remove(support);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SupportExists(int id)
        {
            return _context.Supports.Any(e => e.Idsupport == id);
        }
    }
}