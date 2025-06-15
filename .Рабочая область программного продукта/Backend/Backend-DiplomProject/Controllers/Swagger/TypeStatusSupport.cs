using Backend_DiplomProject.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend_DiplomProject.Controllers.Swagger
{
    [Route("api/[controller]")]
    [ApiController]
    public class TypeStatusSupportController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TypeStatusSupportController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TypeStatusSupport>>> GetTypeStatusSupports()
        {
            return await _context.TypeStatusSupports.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TypeStatusSupport>> GetTypeStatusSupport(int id)
        {
            var typeStatusSupport = await _context.TypeStatusSupports.FindAsync(id);

            if (typeStatusSupport == null)
            {
                return NotFound();
            }

            return typeStatusSupport;
        }

        [HttpPost]
        public async Task<ActionResult<TypeStatusSupport>> PostTypeStatusSupport(TypeStatusSupport typeStatusSupport)
        {
            _context.TypeStatusSupports.Add(typeStatusSupport);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTypeStatusSupport", new { id = typeStatusSupport.Idtypestatussupport }, typeStatusSupport);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTypeStatusSupport(int id, TypeStatusSupport typeStatusSupport)
        {
            if (id != typeStatusSupport.Idtypestatussupport)
            {
                return BadRequest();
            }

            _context.Entry(typeStatusSupport).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TypeStatusSupportExists(id))
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

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTypeStatusSupport(int id)
        {
            var typeStatusSupport = await _context.TypeStatusSupports.FindAsync(id);
            if (typeStatusSupport == null)
            {
                return NotFound();
            }

            _context.TypeStatusSupports.Remove(typeStatusSupport);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TypeStatusSupportExists(int id)
        {
            return _context.TypeStatusSupports.Any(e => e.Idtypestatussupport == id);
        }
    }
}