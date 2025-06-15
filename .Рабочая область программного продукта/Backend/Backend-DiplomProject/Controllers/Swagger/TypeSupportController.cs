using Backend_DiplomProject.Models;
using Backend_DiplomProject;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend_DiplomProject.Controllers.Swagger
{
    [Route("api/[controller]")]
    [ApiController]
    public class TypeSupportController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TypeSupportController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TypeSupport>>> GetTypeSupports()
        {
            return await _context.TypeSupports.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TypeSupport>> GetTypeSupport(int id)
        {
            var typeSupport = await _context.TypeSupports.FindAsync(id);

            if (typeSupport == null)
            {
                return NotFound();
            }

            return typeSupport;
        }

        [HttpPost]
        public async Task<ActionResult<TypeSupport>> PostTypeSupport(TypeSupport typeSupport)
        {
            _context.TypeSupports.Add(typeSupport);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTypeSupport", new { id = typeSupport.Idtypesupport }, typeSupport);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTypeSupport(int id, TypeSupport typeSupport)
        {
            if (id != typeSupport.Idtypesupport)
            {
                return BadRequest();
            }

            _context.Entry(typeSupport).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TypeSupportExists(id))
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
        public async Task<IActionResult> DeleteTypeSupport(int id)
        {
            var typeSupport = await _context.TypeSupports.FindAsync(id);
            if (typeSupport == null)
            {
                return NotFound();
            }

            _context.TypeSupports.Remove(typeSupport);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TypeSupportExists(int id)
        {
            return _context.TypeSupports.Any(e => e.Idtypesupport == id);
        }
    }
}