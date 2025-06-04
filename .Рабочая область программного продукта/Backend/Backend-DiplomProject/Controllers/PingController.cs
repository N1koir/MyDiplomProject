using Microsoft.AspNetCore.Mvc;

namespace Backend_DiplomProject.Controllers
{
    [Route("api/ping")]
    [ApiController]
    public class PingController : ControllerBase
    {
        [HttpGet]
        public IActionResult Ping()
        {
            return Ok(new { status = "ok" });
        }
    }
}
